
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['superadmin', 'store_admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'store_admin',
    },
  });

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setAuthError('Email ou senha inválidos');
        } else if (error.message.includes('Email not confirmed')) {
          setAuthError('Por favor, confirme seu email antes de fazer login');
        } else {
          setAuthError('Erro ao fazer login. Tente novamente.');
        }
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao VendMais",
        });
      }
    } catch (error) {
      setAuthError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupForm) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await signUp(data.email, data.password, data.fullName, data.role);

      if (error) {
        if (error.message.includes('User already registered')) {
          setAuthError('Este email já está cadastrado');
        } else {
          setAuthError('Erro ao criar conta. Tente novamente.');
        }
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta",
        });
        setIsLogin(true);
      }
    } catch (error) {
      setAuthError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setAuthError(null);
    loginForm.reset();
    signupForm.reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-modern">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">VendMais</h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Faça login em sua conta' : 'Crie sua conta'}
            </p>
          </div>

          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...loginForm.register('email')}
                  className="input-modern"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    {...loginForm.register('password')}
                    className="input-modern pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="btn-primary w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  {...signupForm.register('fullName')}
                  className="input-modern"
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="seu@email.com"
                  {...signupForm.register('email')}
                  className="input-modern"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Conta</Label>
                <select
                  {...signupForm.register('role')}
                  className="input-modern w-full"
                >
                  <option value="store_admin">Admin de Loja</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    {...signupForm.register('password')}
                    className="input-modern pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    {...signupForm.register('confirmPassword')}
                    className="input-modern pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="btn-primary w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={toggleMode}
              className="text-primary hover:text-primary/80"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
