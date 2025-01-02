import React from 'react';
import { IframeSandbox } from './IframeSandbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const IframeSandboxDemo = () => {
  return (
    <div className="space-y-8">
      {/* Fully restricted iframe */}
      <Card>
        <CardHeader>
          <CardTitle>Maximum Security Iframe</CardTitle>
          <CardDescription>
            All restrictions enabled - no scripts, forms, or external access allowed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IframeSandbox
            src="https://example.com"
            title="Restricted content"
            height={300}
          />
        </CardContent>
      </Card>

      {/* Iframe with some permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Partially Restricted Iframe</CardTitle>
          <CardDescription>
            Allows scripts and forms, but blocks popups and same-origin requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IframeSandbox
            src="https://example.com"
            title="Semi-restricted content"
            height={300}
            allowScripts
            allowForms
          />
        </CardContent>
      </Card>
    </div>
  );
};