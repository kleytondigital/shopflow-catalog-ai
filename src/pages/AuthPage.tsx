
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de autenticação em desenvolvimento. Aqui você poderá fazer login ou criar uma conta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
