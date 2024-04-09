import styled from "styled-components";
import { Introduction } from "../components/home/Introduction.tsx";
import { MyTech } from "../components/home/MyTech.tsx";

const SizeBox = styled.div`
  height: 200px;
`;

export function HomeScreen() {
  return (
    <>
      <SizeBox />
      <Introduction />
      <MyTech />
    </>
  );
}
