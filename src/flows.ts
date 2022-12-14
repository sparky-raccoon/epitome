import { ButtonInteraction } from "discord.js";
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

import { getMessage } from "./messages";
import {
  AddMachineContext,
  DeleteMachineContext,
  FlowData,
  ListMachineContext,
  MessageTypes,
  Source,
  SourceList,
} from "./types";
import {
  addSource,
  deleteSource,
  getSourceFromUrl,
  listSources,
} from "./utils/source";

const waitingForConfirmation = (nextState: "registering" | "deleting") => state(
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
          MessageTypes.ERROR,
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
            (ctx: AddMachineContext, evt: { type: "done"; data: Source }) => {
              console.log(evt);

              return {
                ...ctx,
                source: evt.data,
              };
            }
          ),
          action(({ interaction, source }: AddMachineContext) => {
            console.log(source);
            const message = getMessage(MessageTypes.ADD_CONFIRM, source);
            interaction.reply(message);
          })
        ),
        transition(
          "error",
          "idle",
          reduce(
            (
              ctx: AddMachineContext,
              evt: { type: "error"; error: string }
            ) => ({
              ...ctx,
              error: evt.error,
            })
          ),
          action(
            ({ interaction, error, userId, cleanup }: AddMachineContext) => {
              const message = getMessage(MessageTypes.ERROR, error);
              interaction.reply(message);
              cleanup(userId);
            }
          )
        )
      ),
      waiting_for_confirmation: waitingForConfirmation("registering"),
      registering: invoke(
        addSource,
        transition(
          "done",
          "idle",
          action(({ interaction, userId, cleanup }: AddMachineContext) => {
            const message = getMessage(MessageTypes.ADD_SUCCESS);
            interaction.reply(message);
            cleanup(userId);
          })
        ),
        transition(
          "error",
          "idle",
          reduce(
            (
              ctx: AddMachineContext,
              evt: { type: "error"; error: string }
            ) => ({
              ...ctx,
              error: evt.error,
            })
          ),
          action(
            ({ interaction, error, userId, cleanup }: AddMachineContext) => {
              const message = getMessage(MessageTypes.ERROR, error);
              interaction.reply(message);
              cleanup(userId);
            }
          )
        )
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
            ) => {
              console.log(evt);

              return {
                ...ctx,
                sourceList: evt.data,
              };
            }
          ),
          action(({ interaction, sourceList }: DeleteMachineContext) => {
            console.log(sourceList);
            const message = getMessage(MessageTypes.DELETE, sourceList);
            interaction.reply(message);
          })
        ),
        transition(
          "error",
          "idle",
          reduce(
            (
              ctx: DeleteMachineContext,
              evt: { type: "error"; error: string }
            ) => ({
              ...ctx,
              error: evt.error,
            })
          ),
          action(
            ({ interaction, error, userId, cleanup }: DeleteMachineContext) => {
              const message = getMessage(MessageTypes.ERROR, error);
              interaction.reply(message);
              cleanup(userId);
            }
          )
        )
      ),
      waiting_for_selection: state(
        transition(
          "selected",
          "waiting_for_confirmation",
          action(({ interaction, source }: DeleteMachineContext) => {
            console.log(source);
            const message = getMessage(MessageTypes.DELETE_CONFIRM, source);
            interaction.reply(message);
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
            const message = getMessage(MessageTypes.DELETE_SUCCESS);
            interaction.reply(message);
            cleanup(userId);
          })
        ),
        transition(
          "error",
          "idle",
          reduce(
            (
              ctx: DeleteMachineContext,
              evt: { type: "error"; error: string }
            ) => ({
              ...ctx,
              error: evt.error,
            })
          ),
          action(
            ({ interaction, error, userId, cleanup }: DeleteMachineContext) => {
              const message = getMessage(MessageTypes.ERROR, error);
              interaction.reply(message);
              cleanup(userId);
            }
          )
        )
      ),
      idle: state(),
    },
    () => initialContext
  );

const listMachine = (initialContext: ListMachineContext) =>
  createMachine(
    {
      reading: state(
        transition("reading_complete", "idle"),
        transition("reading_error", "idle")
      ),
    },
    () => initialContext
  );

class Flow {
  machine: Machine;
  send: SendFunction<SendEvent>;

  constructor(machine: Machine, initialContext: any) {
    this.machine = machine;
    const { send } = interpret(
      this.machine,
      ({ machine, context }) => {
        console.log("Machine state change: ", machine.current);
      },
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
