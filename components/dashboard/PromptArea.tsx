'use client';

import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowUp, Paperclip, Square, X, StopCircle, Mic, Globe, BrainCog, FolderCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from '@/components/ui/BorderBeam';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/* ── Tooltip ────────────────────────────────────────────────── */
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

/* ── Dialog ────────────────────────────────────────────────── */
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/60 backdrop-blur-sm', className)}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-[90vw] md:max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#333333] bg-[#1F2023] shadow-xl',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-[#2E3033]/80 p-2 hover:bg-[#2E3033] transition-all">
        <X className="h-5 w-5 text-gray-200" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold text-gray-100', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

/* ── Textarea ───────────────────────────────────────────────── */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={1}
      className={cn(
        'flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-500 focus-visible:outline-none resize-none',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

/* ── Button ─────────────────────────────────────────────────── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-white hover:bg-white/80 text-black',
        variant === 'ghost' && 'bg-transparent hover:bg-[#3A3A40]',
        size === 'default' && 'h-10 px-4 py-2',
        size === 'icon' && 'h-8 w-8 rounded-full',
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';

/* ── PromptInput Context ─────────────────────────────────────── */
interface PromptInputCtx {
  isLoading: boolean;
  value: string;
  setValue: (v: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}
const PromptInputContext = createContext<PromptInputCtx>({
  isLoading: false, value: '', setValue: () => {}, maxHeight: 240,
});
const usePromptInput = () => useContext(PromptInputContext);

/* ── PromptInput ─────────────────────────────────────────────── */
interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (v: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, isLoading = false, maxHeight = 240, value, onValueChange, onSubmit, children, disabled = false, onDragOver, onDragLeave, onDrop }, ref) => {
    const [internal, setInternal] = useState(value || '');
    return (
      <TooltipProvider>
        <PromptInputContext.Provider value={{ isLoading, value: value ?? internal, setValue: onValueChange ?? setInternal, maxHeight, onSubmit, disabled }}>
          <div
            ref={ref}
            className={cn('relative overflow-hidden rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300', isLoading && 'border-red-500/70', className)}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          >
            {children}
            <BorderBeam size={200} duration={5} colorFrom="#ffaa40" colorTo="#9c40ff" borderWidth={2} />
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  }
);
PromptInput.displayName = 'PromptInput';

/* ── PromptInputTextarea ────────────────────────────────────── */
const PromptInputTextarea: React.FC<{ placeholder?: string; disableAutosize?: boolean } & React.ComponentProps<typeof Textarea>> = ({
  className, onKeyDown, disableAutosize = false, placeholder, ...props
}) => {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (disableAutosize || !textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = typeof maxHeight === 'number'
      ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
      : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit?.(); } onKeyDown?.(e as React.KeyboardEvent<HTMLTextAreaElement>); }}
      className={cn('text-base', className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
};

/* ── PromptInputActions ─────────────────────────────────────── */
const PromptInputActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn('flex items-center gap-2', className)} {...props}>{children}</div>
);

/* ── PromptInputAction ──────────────────────────────────────── */
const PromptInputAction: React.FC<{ tooltip: React.ReactNode; children: React.ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }> = ({
  tooltip, children, side = 'top',
}) => {
  const { disabled } = usePromptInput();
  return (
    <Tooltip>
      <TooltipTrigger asChild disabled={disabled}>{children}</TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

/* ── CustomDivider ──────────────────────────────────────────── */
const CustomDivider = () => (
  <div className="relative h-6 w-[1.5px] mx-1">
    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#9b87f5]/70 to-transparent rounded-full" />
  </div>
);

/* ── VoiceRecorder ──────────────────────────────────────────── */
const VoiceRecorder: React.FC<{ isRecording: boolean; onStartRecording: () => void; onStopRecording: (d: number) => void }> = ({
  isRecording, onStartRecording, onStopRecording,
}) => {
  const [time, setTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      onStartRecording();
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      onStopRecording(time);
      setTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className={cn('flex flex-col items-center justify-center w-full transition-all duration-300 py-3', isRecording ? 'opacity-100' : 'opacity-0 h-0')}>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-sm text-white/80">{fmt(time)}</span>
      </div>
      <div className="w-full h-10 flex items-center justify-center gap-0.5 px-4">
        {[...Array(32)].map((_, i) => (
          <div key={i} className="w-0.5 rounded-full bg-white/50 animate-pulse"
            style={{ height: `${Math.max(15, Math.random() * 100)}%`, animationDelay: `${i * 0.05}s`, animationDuration: `${0.5 + Math.random() * 0.5}s` }} />
        ))}
      </div>
    </div>
  );
};

/* ── ImageViewDialog ─────────────────────────────────────────── */
const ImageViewDialog: React.FC<{ imageUrl: string | null; onClose: () => void }> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
          className="relative bg-[#1F2023] rounded-2xl overflow-hidden shadow-2xl">
          <img src={imageUrl} alt="Full preview" className="w-full max-h-[80vh] object-contain rounded-2xl" />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

/* ── PromptArea (main export) ───────────────────────────────── */
interface PromptAreaProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function PromptArea({ onSend = () => {}, isLoading = false, placeholder = 'Describe your thumbnail idea...' }: PromptAreaProps) {
  // Load Indie Flower font (same as main page title)
  useEffect(() => {
    if (!document.querySelector('link[href*="Indie+Flower"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap';
      document.head.appendChild(link);
    }
  }, []);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThink, setShowThink] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) return;
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = e => setFilePreviews({ [file.name]: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) { e.preventDefault(); processFile(file); break; }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleSubmit = () => {
    if (!input.trim() && files.length === 0) return;
    const prefix = showSearch ? '[Search: ' : showThink ? '[Think: ' : showCanvas ? '[Canvas: ' : '';
    onSend(prefix ? `${prefix}${input}]` : input, files);
    setInput(''); setFiles([]); setFilePreviews({});
  };

  const toggle = (mode: 'search' | 'think' | 'canvas') => {
    if (mode === 'search') { setShowSearch(v => !v); setShowThink(false); }
    else if (mode === 'think') { setShowThink(v => !v); setShowSearch(false); }
    else { setShowCanvas(v => !v); }
  };

  const hasContent = input.trim() !== '' || files.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        disabled={isLoading || isRecording}
        className={cn('w-full', isRecording && 'border-red-500/70')}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onDragLeave={e => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={e => {
          e.preventDefault(); e.stopPropagation();
          const f = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
          if (f.length) processFile(f[0]);
        }}
      >
        {/* File preview */}
        {files.length > 0 && !isRecording && (
          <div className="flex flex-wrap gap-2 pb-1">
            {files.map((file, i) => filePreviews[file.name] && (
              <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden cursor-pointer" onClick={() => setSelectedImage(filePreviews[file.name])}>
                <img src={filePreviews[file.name]} alt={file.name} className="h-full w-full object-cover" />
                <button onClick={e => { e.stopPropagation(); setFiles([]); setFilePreviews({}); }}
                  className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className={cn('transition-all duration-300', isRecording ? 'h-0 overflow-hidden opacity-0' : 'opacity-100')}>
          <PromptInputTextarea
            placeholder={showSearch ? 'Search the web...' : showThink ? 'Think deeply...' : showCanvas ? 'Create on canvas...' : placeholder}
            className="text-base min-h-[52px]"
          />
        </div>

        {/* Voice recorder */}
        {isRecording && (
          <VoiceRecorder isRecording={isRecording} onStartRecording={() => {}} onStopRecording={d => { setIsRecording(false); onSend(`[Voice message - ${d} seconds]`, []); }} />
        )}

        {/* Actions */}
        <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
          <div className={cn('flex items-center gap-1 transition-opacity duration-300', isRecording ? 'opacity-0 invisible h-0' : 'opacity-100 visible')}>
            {/* Attachment */}
            <PromptInputAction tooltip="Upload image">
              <button onClick={() => uploadInputRef.current?.click()}
                className="flex h-8 w-8 text-[#9CA3AF] cursor-pointer items-center justify-center rounded-full hover:bg-gray-600/30 hover:text-[#D1D5DB] transition-colors">
                <Paperclip className="h-5 w-5" />
                <input ref={uploadInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) { processFile(e.target.files[0]); e.target.value = ''; } }} />
              </button>
            </PromptInputAction>

            {/* Mode toggles */}
            <div className="flex items-center">
              {/* Search */}
              <button type="button" onClick={() => toggle('search')}
                className={cn('rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8',
                  showSearch ? 'bg-[#1EAEDB]/15 border-[#1EAEDB] text-[#1EAEDB]' : 'bg-transparent border-transparent text-[#9CA3AF] hover:text-[#D1D5DB]')}>
                <motion.div animate={{ rotate: showSearch ? 360 : 0, scale: showSearch ? 1.1 : 1 }}
                  whileHover={{ rotate: showSearch ? 360 : 15, scale: 1.1 }} transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  className="w-5 h-5 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </motion.div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap">Search</motion.span>
                  )}
                </AnimatePresence>
              </button>

              <CustomDivider />

              {/* Think */}
              <button type="button" onClick={() => toggle('think')}
                className={cn('rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8',
                  showThink ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#8B5CF6]' : 'bg-transparent border-transparent text-[#9CA3AF] hover:text-[#D1D5DB]')}>
                <motion.div animate={{ rotate: showThink ? 360 : 0, scale: showThink ? 1.1 : 1 }}
                  whileHover={{ rotate: showThink ? 360 : 15, scale: 1.1 }} transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  className="w-5 h-5 flex items-center justify-center">
                  <BrainCog className="w-4 h-4" />
                </motion.div>
                <AnimatePresence>
                  {showThink && (
                    <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap">Think</motion.span>
                  )}
                </AnimatePresence>
              </button>

              <CustomDivider />

              {/* Canvas */}
              <button type="button" onClick={() => toggle('canvas')}
                className={cn('rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8',
                  showCanvas ? 'bg-[#F97316]/15 border-[#F97316] text-[#F97316]' : 'bg-transparent border-transparent text-[#9CA3AF] hover:text-[#D1D5DB]')}>
                <motion.div animate={{ rotate: showCanvas ? 360 : 0, scale: showCanvas ? 1.1 : 1 }}
                  whileHover={{ rotate: showCanvas ? 360 : 15, scale: 1.1 }} transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  className="w-5 h-5 flex items-center justify-center">
                  <FolderCode className="w-4 h-4" />
                </motion.div>
                <AnimatePresence>
                  {showCanvas && (
                    <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap">Canvas</motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Send / Mic button */}
          <PromptInputAction tooltip={isLoading ? 'Stop' : isRecording ? 'Stop recording' : hasContent ? 'Send' : 'Voice'}>
            <Button variant="default" size="icon"
              className={cn('h-8 w-8 rounded-full transition-all duration-200',
                isRecording ? 'bg-transparent hover:bg-gray-600/30 text-red-500' :
                hasContent ? 'bg-white hover:bg-white/80 text-[#1F2023]' :
                'bg-transparent hover:bg-gray-600/30 text-[#9CA3AF]')}
              onClick={() => { if (isRecording) setIsRecording(false); else if (hasContent) handleSubmit(); else setIsRecording(true); }}
              disabled={isLoading && !hasContent}>
              {isLoading ? <Square className="h-4 w-4 fill-[#1F2023] animate-pulse" /> :
               isRecording ? <StopCircle className="h-5 w-5 text-red-500" /> :
               hasContent ? <ArrowUp className="h-4 w-4 text-[#1F2023]" /> :
               <Mic className="h-5 w-5 text-[#1F2023]" />}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>

      <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
