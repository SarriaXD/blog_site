import styled from "styled-components";

const Background = styled.div`
  padding-top: 160px;
  margin-left: 80px;
  margin-right: 80px;
`;

export function HomeScreen() {
  return (
    <>
      <Background>
        <h1>Welcome to our website!</h1>
        <p>
          This is a simple website created using React and TypeScript. You can
          find the source code for this website on <a href="" />
        </p>
      </Background>
    </>
  );
}
