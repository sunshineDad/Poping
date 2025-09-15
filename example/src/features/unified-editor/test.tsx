/*
[File Overview]
===============
- Purpose: Test component for UnifiedEditor integration
- Used for: Validating basic functionality before Composer integration
*/

import React, { useRef } from 'react';
import UnifiedEditor, { UnifiedEditorRef } from './UnifiedEditor';

export function UnifiedEditorTest() {
  const editorRef = useRef<UnifiedEditorRef>(null);
  const [value, setValue] = React.useState('');

  const handleTestInsertResource = () => {
    if (editorRef.current) {
      editorRef.current.insertResourceTag('@image://test123/example.png');
    }
  };

  const handleTestInsertCommand = () => {
    if (editorRef.current) {
      const testCommand = {
        id: 'cmd_test_123',
        command: 'text_to_image',
        config: { prompt: 'Test image prompt' },
        display: 'Test Command',
        created_at: new Date().toISOString()
      };
      editorRef.current.insertCommandTag(testCommand);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">UnifiedEditor Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Content:</label>
          <div className="border border-gray-300 rounded p-2">
            <UnifiedEditor
              ref={editorRef}
              value={value}
              onChange={setValue}
              placeholder="Type something..."
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleTestInsertResource}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Insert Resource Tag
          </button>
          
          <button 
            onClick={handleTestInsertCommand}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Insert Command Tag
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Current Value:</label>
          <pre className="bg-gray-100 p-2 text-xs rounded border overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default UnifiedEditorTest;