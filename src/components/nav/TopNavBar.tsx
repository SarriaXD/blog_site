import styled from "styled-components";

const Nav = styled.nav`
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  width: 100%;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  background-color: rgba(28, 28, 28, 0.91);
  display: flex;
  align-items: center;
  box-shadow: 3px, 3px, 3px, rgba(0, 0, 0, 0.1);
`;

const NavLogo = styled.img`
  height: 100%;
  padding: 15px 30px;
  display: flex;
  text-decoration: none;
  align-items: center;
`;

const NavList = styled.ul`
  height: 100%;
  display: flex;
  list-style: none;
`;

const NavItem = styled.li`
  height: 100%;
`;

const NavLink = styled.a`
  height: 100%;
  padding: 0 30px;
  display: flex;
  text-decoration: none;
  align-items: center;
  color: white;
  transition: background-color 0.5s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const TopNavBar = () => {
  return (
    <>
      <Nav>
        <NavLogo src="/logo.png" alt="logo" />
        <NavList>
          <NavItem>
            <NavLink href="/">Home</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/about">About</NavLink>
          </NavItem>
        </NavList>
      </Nav>
    </>
  );
};
