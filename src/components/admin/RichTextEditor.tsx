import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Image,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const insertAtCursor = useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    addToHistory(newText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const wrapSelection = useCallback((tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText: string;
    if (selectedText) {
      newText = value.substring(0, start) + `<${tag}>${selectedText}</${tag}>` + value.substring(end);
    } else {
      newText = value.substring(0, start) + `<${tag}></${tag}>` + value.substring(end);
    }
    
    onChange(newText);
    addToHistory(newText);
  }, [value, onChange]);

  const addToHistory = (newValue: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onChange(history[historyIndex + 1]);
    }
  };

  const insertHeading = (level: number) => {
    const tag = `h${level}`;
    wrapSelection(tag);
  };

  const insertList = (ordered: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const lines = selectedText.split("\n").filter(line => line.trim());
    
    const listItems = lines.map(line => `  <li>${line}</li>`).join("\n");
    const tag = ordered ? "ol" : "ul";
    const newText = value.substring(0, start) + `<${tag}>\n${listItems || "  <li></li>"}\n</${tag}>` + value.substring(end);
    
    onChange(newText);
    addToHistory(newText);
  };

  const insertLink = () => {
    const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
    insertAtCursor(linkHtml);
    setLinkUrl("");
    setLinkText("");
  };

  const insertImage = () => {
    const imgHtml = `<img src="${imageUrl}" alt="${imageAlt}" class="rounded-lg max-w-full h-auto my-4" />`;
    insertAtCursor(imgHtml);
    setImageUrl("");
    setImageAlt("");
  };

  const insertBlockquote = () => {
    wrapSelection("blockquote");
  };

  const insertCode = () => {
    wrapSelection("code");
  };

  const insertParagraph = () => {
    wrapSelection("p");
  };

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void; 
    icon: React.ElementType; 
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="border border-input rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted/50 p-2 flex flex-wrap items-center gap-1 border-b border-input">
        <ToolbarButton onClick={undo} icon={Undo} title="Undo" />
        <ToolbarButton onClick={redo} icon={Redo} title="Redo" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton onClick={() => insertHeading(1)} icon={Heading1} title="Heading 1" />
        <ToolbarButton onClick={() => insertHeading(2)} icon={Heading2} title="Heading 2" />
        <ToolbarButton onClick={() => insertHeading(3)} icon={Heading3} title="Heading 3" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton onClick={() => wrapSelection("strong")} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => wrapSelection("em")} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => wrapSelection("u")} icon={Underline} title="Underline" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton onClick={() => insertList(false)} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => insertList(true)} icon={ListOrdered} title="Numbered List" />
        <ToolbarButton onClick={insertBlockquote} icon={Quote} title="Blockquote" />
        <ToolbarButton onClick={insertCode} icon={Code} title="Code" />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Link Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Link">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-text">Link Text</Label>
                <Input
                  id="link-text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <Button type="button" size="sm" onClick={insertLink} disabled={!linkUrl}>
                Insert Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Image Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Image">
              <Image className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-alt">Alt Text</Label>
                <Input
                  id="image-alt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Description of the image"
                />
              </div>
              <Button type="button" size="sm" onClick={insertImage} disabled={!imageUrl}>
                Insert Image
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={insertParagraph}
        >
          Paragraph
        </Button>
      </div>
      
      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onBlur={() => {
          if (value !== history[historyIndex]) {
            addToHistory(value);
          }
        }}
        placeholder={placeholder}
        className="border-0 rounded-none min-h-[300px] font-mono text-sm resize-y focus-visible:ring-0"
      />
      
      {/* Preview Toggle */}
      <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground border-t border-input">
        <span>HTML Editor • Supports basic HTML tags for formatting</span>
      </div>
    </div>
  );
};