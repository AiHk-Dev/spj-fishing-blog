import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ArticlePage from "./pages/ArticlePage";
import AdminPage from "./pages/AdminPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RegisterPendingPage from "./pages/RegisterPendingPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/article/:id"} component={ArticlePage} />
      <Route path={"/admin"} component={AdminPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/terms"} component={TermsPage} />
      <Route path={"/privacy"} component={PrivacyPage} />
      <Route path={"/register-pending"} component={RegisterPendingPage} />
      <Route path={"/verify-email"} component={VerifyEmailPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
