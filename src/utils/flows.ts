import { ChatInputCommandInteraction, ButtonInteraction } from "discord.js";
import {
  createMachine,
  state,
  transition,
  Machine,
  interpret,
  invoke,
  reduce,
  action,
  SendFunction,
  SendEvent,
} from "robot3";
import { Message } from "@/constants";
import { Source, SourceList } from "@/types";
import { getMessage } from "@/utils/messages";
import {
  addSource,
  deleteSource,
  getSourceFromUrl,
  listSources,
} from "@/utils/source";

type FlowData = {
  userId: string;
  interaction: ChatInputCommandInteraction | ButtonInteraction;
  cleanup: (userId: string) => void;
};

type AddMachineContext = FlowData & {
  url: string;
  source?: Source;
  error?: string;
};

type DeleteMachineContext = FlowData & {
  sourceList?: SourceList;
  source?: Source;
  error?: string;
};

type ListMachineContext = FlowData & {
  sourceList?: SourceList;
  error?: string;
};

const errorTransition = transition(
  "error",
  "idle",
  reduce((ctx: any, evt: { type: "error"; error: string }) => ({
    ...ctx,
    error: evt.error,
  })),
  action(({ interaction, error, userId, cleanup }: any) => {
    interaction.reply(getMessage(Message.ERROR, error));
    cleanup(userId);
  })
);

const waitingForConfirmation = (nextState: "registering" | "deleting") =>
  state(
    transition(
      "confirmed",
      nextState,
      reduce(
        (
          ctx: AddMachineContext | DeleteMachineContext,
          evt: { type: "confirmed"; interaction: ButtonInteraction }
        ) => ({
          ...ctx,
          interaction: evt.interaction,
        })
      )
    ),
    transition(
      "cancel",
      "idle",
      reduce(
        (
          ctx: AddMachineContext | DeleteMachineContext,
          evt: { type: "cancel"; interaction: ButtonInteraction }
        ) => ({
          ...ctx,
          interaction: evt.interaction,
        })
      ),
      action(
        ({
          interaction,
          userId,
          cleanup,
        }: AddMachineContext | DeleteMachineContext) => {
          const message = getMessage(
            Message.ERROR,
            "La procédure d'ajout a été annulée."
          );
          interaction.reply(message);
          cleanup(userId);
        }
      )
    ),
    transition("timeout", "idle")
  );

const addMachine = (initialContext: AddMachineContext) =>
  createMachine(
    {
      searching: invoke(
        getSourceFromUrl,
        transition(
          "done",
          "waiting_for_confirmation",
          reduce(
            (ctx: AddMachineContext, evt: { type: "done"; data: Source }) => ({
              ...ctx,
              source: evt.data,
            })
          ),
          action(({ interaction, source }: AddMachineContext) => {
            interaction.reply(getMessage(Message.ADD_CONFIRM, source));
          })
        ),
        errorTransition
      ),
      waiting_for_confirmation: waitingForConfirmation("registering"),
      registering: invoke(
        addSource,
        transition(
          "done",
          "idle",
          action(({ interaction, userId, cleanup }: AddMachineContext) => {
            interaction.reply(getMessage(Message.ADD_SUCCESS));
            cleanup(userId);
          })
        ),
        errorTransition
      ),
      idle: state(),
    },
    () => ({ ...initialContext })
  );

const deleteMachine = (initialContext: DeleteMachineContext) =>
  createMachine(
    {
      reading: invoke(
        listSources,
        transition(
          "done",
          "waiting_for_selection",
          reduce(
            (
              ctx: DeleteMachineContext,
              evt: { type: "done"; data: SourceList }
            ) => ({
              ...ctx,
              sourceList: evt.data,
            })
          ),
          action(({ interaction, sourceList }: DeleteMachineContext) => {
            interaction.reply(getMessage(Message.DELETE_SELECT, sourceList));
          })
        ),
        errorTransition
      ),
      waiting_for_selection: state(
        transition(
          "selected",
          "waiting_for_confirmation",
          action(({ interaction, source }: DeleteMachineContext) => {
            interaction.reply(getMessage(Message.DELETE_CONFIRM, source));
          })
        ),
        transition("timeout", "idle")
      ),
      waiting_for_confirmation: waitingForConfirmation("deleting"),
      deleting: invoke(
        deleteSource,
        transition(
          "done",
          "idle",
          action(({ interaction, userId, cleanup }: DeleteMachineContext) => {
            interaction.reply(getMessage(Message.DELETE_SUCCESS));
            cleanup(userId);
          })
        ),
        errorTransition
      ),
      idle: state(),
    },
    () => initialContext
  );

const listMachine = (initialContext: ListMachineContext) =>
  createMachine(
    {
      reading: invoke(
        listSources,
        transition(
          "done",
          "idle",
          reduce(
            (
              ctx: DeleteMachineContext,
              evt: { type: "done"; data: SourceList }
            ) => ({
              ...ctx,
              sourceList: evt.data,
            })
          ),
          action(({ interaction, sourceList, userId, cleanup }) => {
            interaction.reply(getMessage(Message.LIST, sourceList));
            cleanup(userId);
          })
        ),
        errorTransition
      ),
      idle: state(),
    },
    () => initialContext
  );

class Flow {
  machine: Machine;
  send: SendFunction<SendEvent>;

  constructor(machine: Machine, initialContext: any) {
    this.machine = machine;
    const { send } = interpret(this.machine, undefined, initialContext);
    this.send = send;
  }

  state(): string {
    return this.machine.current;
  }

  update(event: SendEvent) {
    this.send(event);
  }
}

class AddFlow extends Flow {
  constructor({
    userId,
    interaction,
    url,
    cleanup,
  }: FlowData & { url: string }) {
    const initialContext: AddMachineContext = {
      userId,
      interaction,
      url,
      cleanup,
    };

    super(addMachine(initialContext), initialContext);
  }
}

class DeleteFlow extends Flow {
  constructor({ userId, interaction, cleanup }: FlowData) {
    const initialContext: DeleteMachineContext = {
      userId,
      interaction,
      cleanup,
    };

    super(deleteMachine(initialContext), initialContext);
  }
}

class ListFlow extends Flow {
  constructor({ userId, interaction, cleanup }: FlowData) {
    const initialContext: ListMachineContext = {
      userId,
      interaction,
      cleanup,
    };

    super(listMachine(initialContext), initialContext);
  }
}

export { AddFlow, DeleteFlow, ListFlow };
