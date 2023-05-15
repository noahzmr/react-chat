import React from 'react'
import Markdown from 'react-markdown'
import { atomDark as Style } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import '../../../style/markdown/index.css'
import PropTypes from 'prop-types'
import remarkGfm from 'remark-gfm'
import remarkMermaidPlugin from 'remark-mermaid-plugin'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
// coldarkDark
//  nightOwl
//  oneDark
// vscDarkPlus

// atomDark
// materialDark
// tomorrow

export default function MarkdownView(props) {
  MarkdownView.propTypes = {
    text: PropTypes.any
  }
  return (
    /* eslint-disable react/no-children-prop */
    <Markdown
      className="markdown-body"
      children={props.text}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')

          return !inline && match && !match.includes('mermaid') ? (
            <SyntaxHighlighter
              style={Style}
              PreTag="div"
              language={match[1]}
              children={String(children).replace(/\n$/, '')}
              {...props}
            />
          ) : (
            <code className={className ? className : ''} {...props}>
              {children}
            </code>
          )
        }
      }}
      remarkPlugins={[remarkGfm, [remarkMermaidPlugin, { theme: 'dark' }]]}
      rehypePlugins={[rehypeRaw, rehypeStringify]}
    />
    /* eslint-enable react/no-children-prop */
  )
  /* eslint-enable react/no-children-prop */
}
