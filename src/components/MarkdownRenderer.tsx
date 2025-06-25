'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  children: string;
}

const MarkdownRenderer = ({ children }: MarkdownRendererProps) => {
  const components = {
    code({ 
      inline, 
      className, 
      children, 
      ...props 
    }: {
      inline?: boolean;
      className?: string;
      children: React.ReactNode;
    }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // @ts-expect-error -- the types are complex and i dont wanna deal with that shit rn
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
