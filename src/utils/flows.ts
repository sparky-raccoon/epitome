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

interface BaseContext {
  userId: string;
  interaction: ChatInputCommandInteraction | ButtonInteraction;
  cleanup: (userId: string) => void;
}

interface AddContext extends BaseContext {
  url: string;
  source?: Source;
  error?: string;
}

interface DeleteContext extends BaseContext {
  sourceList?: SourceList;
  source?: Source;
  error?: string;
}

interface ListContext extends BaseContext {
  sourceList?: SourceList;
  error?: string;
}

type AnyContext = AddContext | DeleteContext | ListContext;

const errorTransition = transition(
  "error",
  "idle",
  reduce((ctx: AnyContext, evt: { type: "error"; error: string }) => ({
    ...ctx,
    error: evt.error,
  })),
  action(({ interaction, error, userId, cleanup }: AnyContext) => {
    interaction.reply(getMessage(Message.ERROR, error));
    cleanup(userId);
  })
);

const waitingForConfirmationState = state(
  transition(
    "confirmed",
    "proceeding",
    reduce(
      (
        ctx: AnyContext,
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
        ctx: AnyContext,
        evt: { type: "cancel"; interaction: ButtonInteraction }
      ) => ({
        ...ctx,
        interaction: evt.interaction,
      })
    ),
    action(({ interaction, userId, cleanup }: AnyContext) => {
      interaction.reply(
        getMessage(Message.ERROR, "La procédure a été annulée.")
      );
      cleanup(userId);
    })
  ),
  transition("timeout", "idle")
);

const addMachine = (initialContext: AddContext) =>
  createMachine(
    {
      searching: invoke(
        getSourceFromUrl,
        transition(
          "done",
          "waiting_for_confirmation",
          reduce((ctx: AddContext, evt: { type: "done"; data: Source }) => ({
            ...ctx,
            source: evt.data,
          })),
          action(({ interaction, source }: AddContext) => {
            interaction.reply(getMessage(Message.ADD_CONFIRM, source));
          })
        ),
        errorTransition
      ),
      waiting_for_confirmation: waitingForConfirmationState,
      proceeding: invoke(
        addSource,
        transition(
          "done",
          "idle",
          action(({ interaction, userId, cleanup }: AddContext) => {
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

const deleteMachine = (initialContext: DeleteContext) =>
  createMachine(
    {
      reading: invoke(
        listSources,
        transition(
          "done",
          "waiting_for_selection",
          reduce(
            (ctx: DeleteContext, evt: { type: "done"; data: SourceList }) => ({
              ...ctx,
              sourceList: evt.data,
            })
          ),
          action(({ interaction, sourceList }: DeleteContext) => {
            interaction.reply(getMessage(Message.DELETE_SELECT, sourceList));
          })
        ),
        errorTransition
      ),
      waiting_for_selection: state(
        transition(
          "selected",
          "waiting_for_confirmation",
          action(({ interaction, source }: DeleteContext) => {
            interaction.reply(getMessage(Message.DELETE_CONFIRM, source));
          })
        ),
        transition("timeout", "idle")
      ),
      waiting_for_confirmation: waitingForConfirmationState,
      proceeding: invoke(
        deleteSource,
        transition(
          "done",
          "idle",
          action(({ interaction, userId, cleanup }: DeleteContext) => {
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

const listMachine = (initialContext: ListContext) =>
  createMachine(
    {
      reading: invoke(
        listSources,
        transition(
          "done",
          "idle",
          reduce(
            (ctx: DeleteContext, evt: { type: "done"; data: SourceList }) => ({
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

  constructor(machine: Machine, initialContext: AnyContext) {
    this.machine = machine;
    const { send } = interpret(
      this.machine,
      (ev) => console.log(ev),
      initialContext
    );
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
  }: BaseContext & { url: string }) {
    const initialContext: AddContext = {
      userId,
      interaction,
      url,
      cleanup,
    };

    super(addMachine(initialContext), initialContext);
  }
}

class DeleteFlow extends Flow {
  constructor({ userId, interaction, cleanup }: BaseContext) {
    const initialContext: DeleteContext = {
      userId,
      interaction,
      cleanup,
    };

    super(deleteMachine(initialContext), initialContext);
  }
}

class ListFlow extends Flow {
  constructor({ userId, interaction, cleanup }: BaseContext) {
    const initialContext: ListContext = {
      userId,
      interaction,
      cleanup,
    };

    super(listMachine(initialContext), initialContext);
  }
}

export { AddFlow, DeleteFlow, ListFlow };
