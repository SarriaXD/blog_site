import { TopNavBar } from "./components/nav/TopNavBar.tsx";
import { HomeScreen } from "./components/HomeScreen.tsx";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    html {
         background-color: rgba(28, 28, 28);
    }

     body {
        min-height: 150vh;
        background: linear-gradient(45deg, #1c1c1c, #0F0F0F);
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <TopNavBar />
      <HomeScreen />
    </>
  );
}

export default App;
