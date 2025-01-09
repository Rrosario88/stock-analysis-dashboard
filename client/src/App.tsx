import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
    </Switch>
  );
}

export default App;
