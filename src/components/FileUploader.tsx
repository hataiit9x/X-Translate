import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";

interface FileUploaderProps {
  onFileLoad: (content: string, fileName: string) => void;
  isDisabled?: boolean;
}

export function FileUploader({ onFileLoad, isDisabled }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = () => {
        const content = reader.result as string;
        onFileLoad(content, file.name);
      };

      reader.readAsText(file, "utf-8");
    },
    [onFileLoad]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md", ".markdown"],
    },
    multiple: false,
    disabled: isDisabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <>
            <FileText className="w-12 h-12 text-blue-500" />
            <p className="text-blue-600 font-medium">Drop the file here...</p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400" />
            <p className="text-gray-600">
              Drag & drop a file here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              Supports .txt, .md, .markdown files
            </p>
          </>
        )}
      </div>
    </div>
  );
}
