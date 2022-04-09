import { Message } from 'discord.js';
import { MessageTypes, Source } from './types';

export class AddFlow {
    _step = 0;
    _messageType: MessageTypes = MessageTypes.NULL;
    _lastMessage: Message | undefined;
    _sourceToAdd: Source | undefined;
    _initiator = '';

    constructor(initiator: string) {
        this._initiator = initiator;
    }

    next(data?: string) {
        switch (this._step) {
            case 0: {
                this._messageType = MessageTypes.ADD;
                break;
            }
            case 1: {
                switch (data) {
                    case 'ig':
                        this._messageType = MessageTypes.ADD_INSTAGRAM;
                        break;
                    case 'twitter':
                        this._messageType = MessageTypes.ADD_TWITTER;
                        break;
                    case 'youtube':
                        this._messageType = MessageTypes.ADD_YOUTUBE;
                        break;
                    case 'rss':
                    default:
                        this._messageType = MessageTypes.ADD_RSS;
                        break;
                }
                break;
            }
            case 2: {
                this._messageType = MessageTypes.ADD_CONFIRM;
                break;
            }
            case 3: {
                this._messageType = MessageTypes.ADD_COMPLETE;
                break;
            }
        }

        this._step++;
    }

    initiator = () => this._initiator;
    messageType = () => this._messageType;
    step = () => this._step;
    isComplete = () => this._messageType === MessageTypes.ADD_COMPLETE;
    isAtInteractiveStep = () => this._messageType === MessageTypes.ADD ||
        this._messageType === MessageTypes.ADD_CONFIRM;
    getLastMessage = () => this._lastMessage;
    getSourceToAdd = () => this._sourceToAdd;

    setLastMessage = (message: Message) => this._lastMessage = message;
    setSourceToAdd = (source: Source) => this._sourceToAdd = source;
    cancel = () => this._messageType = MessageTypes.ADD_CANCEL;
    errorOrRetry = () => {
        this._step = 2;
        this._messageType = MessageTypes.ADD_OUPS;
    }
}

export class DeleteFlow {
    _step = 0;
    _messageType: MessageTypes = MessageTypes.NULL;
    _lastMessage: Message | undefined;
    _initiator = '';

    constructor(initiator: string) {
        this._initiator = initiator;
    }

    next() {
        switch (this._step) {
            case 0: {
                this._messageType = MessageTypes.DELETE;
                break;
            }
            case 1: {
                this._messageType = MessageTypes.DELETE_CONFIRM;
                break;
            }
            case 2: {
                this._messageType = MessageTypes.DELETE_COMPLETE;
                break;
            }
        }

        this._step++;
    }

    initiator = () => this._initiator;
    messageType = () => this._messageType;
    isAtInteractiveStep = () => this._messageType === MessageTypes.DELETE_CONFIRM;
    getLastMessage = () => this._lastMessage;

    setLastMessage = (message: Message) => this._lastMessage = message;
    cancel = () => this._messageType = MessageTypes.DELETE_CANCEL;
    errorOrRetry = () => this._messageType = MessageTypes.DELETE_OUPS;
}