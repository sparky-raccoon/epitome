import { ChatInputCommandInteraction } from "discord.js";
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
} from "./types";
import { addSource, getSourceFromUrl } from "./utils/source";

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
      waiting_for_confirmation: state(
        transition("confirm", "registering"),
        transition(
          "cancel",
          "idle",
          action(({ interaction, userId, cleanup }: AddMachineContext) => {
            const message = getMessage(
              MessageTypes.ERROR,
              "La procédure d'ajout a été annulée."
            );
            interaction.reply(message);
            cleanup(userId);
          })
        ),
        transition("timeout", "idle")
      ),
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
      reading: state(
        transition("reading_complete", "waiting_for_selection"),
        transition("reading_error", "idle"),
        transition("cancel", "idle")
      ),
      waiting_for_selection: state(
        transition("selected", "waiting_for_confirmation"),
        transition("timeout", "idle")
      ),
      waiting_for_confirmation: state(
        transition("confirmed", "deleting"),
        transition("timeout", "idle")
      ),
      deleting: state(
        transition("deleting_complete", "idle"),
        transition("deleting_error", "idle")
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
        // console.log(machine.current, context);
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
