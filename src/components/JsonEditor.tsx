import React, { useState, useEffect } from "react";

interface JsonEditorProps {
  baseTextColor: string;
  websocket: WebSocket | null;
  connectionState: string;
}

export default function JsonEditor({ baseTextColor, websocket, connectionState }: JsonEditorProps) {
  const [originalJsonContent, setOriginalJsonContent] = useState<string>('');
  const [currentJsonContent, setCurrentJsonContent] = useState<string>('');
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Listen for WebSocket messages to capture JSON content
  useEffect(() => {
    if (!websocket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'json_content' && data.success) {
          const formattedJson = JSON.stringify(data.data, null, 2);
          setOriginalJsonContent(formattedJson);
          setCurrentJsonContent(formattedJson);
          setHasChanges(false);
          setLastUpdated(new Date().toLocaleTimeString());
        } else if (data.type === 'write_response' && data.success) {
          // After successful write, update original content
          setOriginalJsonContent(currentJsonContent);
          setHasChanges(false);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    websocket.addEventListener('message', handleMessage);
    return () => websocket.removeEventListener('message', handleMessage);
  }, [websocket, currentJsonContent]);

  // Check for changes whenever content is modified
  useEffect(() => {
    setHasChanges(currentJsonContent !== originalJsonContent && currentJsonContent.trim() !== '');
  }, [currentJsonContent, originalJsonContent]);

  const loadJsonFile = async () => {
    if (!websocket || connectionState !== 'connected') return;
    
    setIsLoading(true);
    const command = {
      action: "read_json"
    };
    
    websocket.send(JSON.stringify(command));
    
    // Reset loading state after a timeout (in case no response)
    setTimeout(() => setIsLoading(false), 3000);
  };

  const saveJsonFile = async () => {
    if (!websocket || connectionState !== 'connected' || !hasChanges) return;
    
    try {
      const parsedJson = JSON.parse(currentJsonContent);
      setIsLoading(true);
      
      const command = {
        action: "write_json",
        data: parsedJson
      };
      
      websocket.send(JSON.stringify(command));
      
      // Reset loading state after a timeout
      setTimeout(() => setIsLoading(false), 3000);
    } catch (error) {
      alert('Invalid JSON format. Please check your syntax.');
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(currentJsonContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setCurrentJsonContent(formatted);
    } catch (error) {
      alert('Invalid JSON format. Cannot format.');
    }
  };

  const resetChanges = () => {
    setCurrentJsonContent(originalJsonContent);
    setHasChanges(false);
  };

  return (
    <div className="bg-[#181818] rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: baseTextColor }}>JSON File Editor</h3>
        {lastUpdated && (
          <span className="text-xs text-gray-400">
            Last updated: {lastUpdated}
          </span>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={loadJsonFile}
          disabled={connectionState !== 'connected' || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
              Loading...
            </>
          ) : (
            'Load JSON'
          )}
        </button>
        
        <button
          onClick={saveJsonFile}
          disabled={connectionState !== 'connected' || !hasChanges || isLoading}
          className={`px-3 py-1 rounded text-sm transition ${
            hasChanges
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 text-gray-400'
          } disabled:bg-gray-600 disabled:text-gray-400`}
        >
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </button>

        <button
          onClick={formatJson}
          disabled={!currentJsonContent.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
        >
          Format
        </button>

        {hasChanges && (
          <button
            onClick={resetChanges}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex gap-4 mb-3 text-xs">
        <span className={`${connectionState === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
          {connectionState === 'connected' ? '● Connected' : '● Disconnected'}
        </span>
        {hasChanges && (
          <span className="text-yellow-400">● Unsaved changes</span>
        )}
        <span style={{ color: baseTextColor }}>
          {currentJsonContent.split('\n').length} lines
        </span>
      </div>

      {/* JSON Editor */}
      <div className="flex-1 flex flex-col">
        <textarea
          value={currentJsonContent}
          onChange={(e) => setCurrentJsonContent(e.target.value)}
          placeholder="JSON content will appear here after loading..."
          className="flex-1 bg-[#111] text-white p-3 rounded border border-[#333] font-mono text-sm resize-none focus:outline-none focus:border-blue-500 min-h-[400px]"
          spellCheck={false}
        />
      </div>

      {/* Connection Warning */}
      {connectionState !== 'connected' && (
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600 rounded text-yellow-300 text-sm">
          ⚠️ WebSocket not connected. Please connect to load/save JSON files.
        </div>
      )}
    </div>
  );
}
