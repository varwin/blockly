import {Abstract as AbstractEvent, AbstractEventJson} from './events_abstract.js';
import {ArgumentLocalBlock} from '../../blocks/argument_local.js';
import {Block} from '../block.js';
import * as registry from '../registry.js';
import * as eventUtils from '../events/utils.js';
import {Workspace} from '../workspace.js';

export class LocalArgumentRename extends AbstractEvent {
  override type = eventUtils.LOCAL_ARGUMENT_RENAME;
  override isBlank = false;

  parentBlockId_?: string;
  blockId_?: string;
  oldTextValue_?: string;
  newTextValue_?: string;

  constructor(argument?: ArgumentLocalBlock, newValue?: string, parentBlock?: Block) {
    super();
    this.blockId_ = argument?.id;
    this.oldTextValue_ = argument?.getFieldText('VALUE') ?? '';
    this.newTextValue_ = newValue;
    this.parentBlockId_ = parentBlock?.id;
    this.workspaceId = argument?.workspace.id;
    this.recordUndo = true;
  }

  override run(forward: boolean) {
    const newValue = forward ? this.newTextValue_ : this.oldTextValue_;
    const oldValue = forward ? this.oldTextValue_ : this.newTextValue_;

    const workspace = this.getEventWorkspace_();
    if (!workspace || this.blockId_ == null) {
      return;
    }

    const block = workspace.getBlockById(this.blockId_);
    const parentBlock = this.parentBlockId_ ? workspace.getBlockById(this.parentBlockId_) : null;

    if (!block) {
      return;
    }

    const argument = block as ArgumentLocalBlock;
    argument?.changeArgumentName(newValue ?? oldValue ?? '', parentBlock);
  }

  override toJson(): LocalArgumentRenameJson {
    const json = super.toJson() as LocalArgumentRenameJson;
    json['parentBlockId'] = this.parentBlockId_ ?? '';
    json['blockId'] = this.blockId_ ?? '';
    json['oldTextValue'] = this.oldTextValue_ ?? '';
    json['newTextValue'] = this.newTextValue_ ?? '';
    return json;
  }

  static fromJson(
    json: LocalArgumentRenameJson,
    workspace: Workspace,
    event?: any,
  ): LocalArgumentRename {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new LocalArgumentRename(),
    ) as LocalArgumentRename;
    newEvent.parentBlockId_ = json['parentBlockId'] ?? '';
    newEvent.blockId_ = json['blockId'] ?? '';
    newEvent.oldTextValue_ = json['oldTextValue'] ?? '';
    newEvent.newTextValue_ = json['newTextValue'] ?? '';
    return newEvent;
  }
}

export interface LocalArgumentRenameJson extends AbstractEventJson {
  parentBlockId?: string;
  blockId?: string;
  oldTextValue?: string;
  newTextValue?: string;
}

registry.register(registry.Type.EVENT, eventUtils.LOCAL_ARGUMENT_RENAME, LocalArgumentRename);
