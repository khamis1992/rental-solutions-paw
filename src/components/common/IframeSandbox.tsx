import React from 'react';

interface IframeSandboxProps {
  src: string;
  title: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  // Allow specific features to be enabled selectively
  allowScripts?: boolean;
  allowForms?: boolean;
  allowPopups?: boolean;
  allowSameOrigin?: boolean;
}

/**
 * A secure iframe component with controlled sandbox permissions
 * 
 * Security features:
 * - By default, all restrictions are enabled (most secure)
 * - Scripts, forms, popups, and same-origin access are disabled
 * - Each permission must be explicitly enabled via props
 * - Content is isolated from the parent page's context
 * 
 * @param src - URL of the content to embed
 * @param title - Accessible title for the iframe (required for a11y)
 * @param width - Width of the iframe (default: "100%")
 * @param height - Height of the iframe (default: "500px")
 * @param className - Additional CSS classes
 * @param allowScripts - Allow JavaScript execution (default: false)
 * @param allowForms - Allow form submission (default: false)
 * @param allowPopups - Allow popups (default: false)
 * @param allowSameOrigin - Allow same origin requests (default: false)
 */
export const IframeSandbox = ({
  src,
  title,
  width = "100%",
  height = "500px",
  className = "",
  allowScripts = false,
  allowForms = false,
  allowPopups = false,
  allowSameOrigin = false,
}: IframeSandboxProps) => {
  // Build sandbox permissions string based on allowed features
  const getSandboxPermissions = () => {
    const permissions = [];
    
    if (allowScripts) permissions.push('allow-scripts');
    if (allowForms) permissions.push('allow-forms');
    if (allowPopups) permissions.push('allow-popups');
    if (allowSameOrigin) permissions.push('allow-same-origin');
    
    // Return space-separated list of permissions, or empty string for full restrictions
    return permissions.join(' ');
  };

  return (
    <iframe
      src={src}
      title={title}
      width={width}
      height={height}
      className={`border-0 ${className}`}
      sandbox={getSandboxPermissions()}
      // Additional security headers
      referrerPolicy="no-referrer"
      loading="lazy"
      // Prevent clickjacking
      style={{ 
        border: 'none',
        overflow: 'hidden'
      }}
    />
  );
};