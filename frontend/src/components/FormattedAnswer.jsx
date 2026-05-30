/**
 * =============================================================================
 * QUERY.IN - FORMATTED ANSWER COMPONENT
 * =============================================================================
 * Modern SaaS-style answer renderer with clean typography.
 * Supports bullet lists, numbered lists, bold text, and code blocks.
 *
 * @component FormattedAnswer
 */

const FormattedAnswer = ({ text }) => {
  if (!text) return null;

  const sections = text.split('\n\n').filter(Boolean);

  const formatLine = (line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      return (
        <li key={idx} className="ml-5 list-disc list-inside text-gray-700 leading-relaxed">
          <span className="font-medium text-gray-900">{formatInline(trimmed.slice(2))}</span>
        </li>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.\s)(.*)/);
      return (
        <li key={idx} className="ml-5 list-decimal list-inside text-gray-700 leading-relaxed">
          <span className="font-medium text-gray-900">{formatInline(match[2])}</span>
        </li>
      );
    }

    if (trimmed.startsWith('```')) {
      return (
        <pre key={idx} className="bg-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto border border-gray-200 my-4">
          <code className="text-gray-800">{trimmed.replace(/```/g, '')}</code>
        </pre>
      );
    }

    return (
      <p key={idx} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
        {formatInline(trimmed)}
      </p>
    );
  };

  const formatInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const hasList = sections.some(s => s.trim().startsWith('- ') || s.trim().startsWith('• ') || /^\d+\.\s/.test(s.trim()));

  if (hasList) {
    const listItems = [];
    const nonListSections = [];

    sections.forEach(section => {
      const trimmed = section.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || /^\d+\.\s/.test(trimmed)) {
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const items = trimmed.split('\n').filter(l => l.trim().startsWith('- ') || l.trim().startsWith('• '));
          listItems.push(...items);
        } else if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter(l => /^\d+\.\s/.test(l.trim()));
          listItems.push(...items);
        }
      } else {
        nonListSections.push(section);
      }
    });

    return (
      <div className="space-y-4">
        {nonListSections.map((section, idx) => formatLine(section, idx))}
        {listItems.length > 0 && (
          <ul className="space-y-2">
            {listItems.map((item, idx) => formatLine(item, `list-${idx}`))}
          </ul>
        )}
      </div>
    );
  }

  return <div className="space-y-1">{sections.map((section, idx) => formatLine(section, idx))}</div>;
};

export default FormattedAnswer;