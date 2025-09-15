/*
[File Overview]
===============
- Purpose: Export interface for UnifiedEditor module
- Exports: Main component and supporting types
*/

export { default as UnifiedEditor } from './UnifiedEditor';
export type { UnifiedEditorRef } from './UnifiedEditor';

// Enable custom nodes and plugins
export { ResourceTagNode } from './nodes/ResourceTagNode';
export type { SerializedResourceTagNode } from './nodes/ResourceTagNode';

export { CommandTagNode } from './nodes/CommandTagNode';
export type { SerializedCommandTagNode } from './nodes/CommandTagNode';

export { SlashCommandPlugin } from './plugins/SlashCommandPlugin';
export { ResourceTagTransformPlugin } from './plugins/ResourceTagTransformPlugin';
export { SimpleSlashPlugin } from './plugins/SimpleSlashPlugin';
