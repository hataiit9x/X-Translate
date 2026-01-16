interface TranslationViewProps {
  original: string;
  translated: string;
}

export function TranslationView({ original, translated }: TranslationViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Original</h3>
        <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {original || "No content loaded"}
          </pre>
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Translated</h3>
        <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {translated || "Translation will appear here"}
          </pre>
        </div>
      </div>
    </div>
  );
}
