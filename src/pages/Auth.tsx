import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    signIn,
    signUp,
    isAuthenticated,
    loading: authLoading,
  } = useAuthSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect se já autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos. Verifique suas credenciais.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu email antes de fazer login.");
        } else {
          setError(error.message);
        }
        return;
      }

      toast.success("Login realizado com sucesso!");
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
      console.error("Erro no login:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, {
        full_name: fullName,
        role: "store_admin",
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("Este email já está cadastrado. Tente fazer login.");
        } else {
          setError(error.message);
        }
        return;
      }

      toast.success(
        "Conta criada com sucesso! Verifique seu email para confirmar."
      );
      setActiveTab("signin");
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
      console.error("Erro no cadastro:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Lado Esquerdo - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-black flex-col justify-center items-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-md px-8">
          <div className="mb-8">
            <img
              src="/b2x-logo.png"
              alt="B2X Logo"
              className="h-16 mx-auto mb-6 filter brightness-0 invert"
            />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">VendeMais</h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Transforme seu negócio com catálogos digitais profissionais. Venda
            mais, gerencie melhor.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-gray-300">Catálogos personalizados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-gray-300">Gestão completa de produtos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-gray-300">Integração com WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/b2x-logo.png"
              alt="B2X Logo"
              className="h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-black">VendeMais</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-8">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
                activeTab === "signin"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
                activeTab === "signup"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border-red-200 bg-red-50"
            >
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Sign In Form */}
          {activeTab === "signin" && (
            <div className="space-y-6 auth-form-animate">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">
                  Bem-vindo de volta!
                </h2>
                <p className="text-gray-600">
                  Entre com suas credenciais para continuar
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-email"
                    className="text-black font-medium"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black rounded-lg auth-input transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signin-password"
                    className="text-black font-medium"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      required
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-black focus:ring-black rounded-lg auth-input transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 auth-button text-white font-medium rounded-lg flex items-center justify-center space-x-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Sign Up Form */}
          {activeTab === "signup" && (
            <div className="space-y-6 auth-form-animate">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">
                  Crie sua conta
                </h2>
                <p className="text-gray-600">
                  Comece sua jornada digital conosco
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-name"
                    className="text-black font-medium"
                  >
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black rounded-lg auth-input transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-black font-medium"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black rounded-lg auth-input transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-black font-medium"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-black focus:ring-black rounded-lg auth-input transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signup-confirm"
                    className="text-black font-medium"
                  >
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="signup-confirm"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      required
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-black focus:ring-black rounded-lg auth-input transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 auth-button text-white font-medium rounded-lg flex items-center justify-center space-x-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Criando conta...</span>
                    </>
                  ) : (
                    <>
                      <span>Criar Conta</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Ao continuar, você concorda com nossos{" "}
              <a href="#" className="text-black hover:underline font-medium">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="#" className="text-black hover:underline font-medium">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
