import {Collapse, Container, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink} from "reactstrap";
import {NavLink as RRNavLink} from "react-router-dom";
import {useState} from "react";

const Header = () => {

	const [collapsed, setCollapsed] = useState(true);

	const toggleNavbar = () => setCollapsed(!collapsed);

	const hideMenu = () => setCollapsed(true)

    return (
		<header>
			{/* УБРАЛ: collapseOnSelect и внутренний Navbar */}
			<Navbar dark className="p-0" expand="lg">
				<Container className="p-0">
					{/* УБРАЛ: весь этот Navbar - он лишний */}
					<NavbarBrand tag={RRNavLink} to="/">
						История и культура
					</NavbarBrand>
					<NavbarToggler aria-controls="responsive-navbar-nav" onClick={toggleNavbar} />
					<Collapse id="responsive-navbar-nav" navbar isOpen={!collapsed}>
						<Nav className="mr-auto fs-5 d-flex flex-grow-1 justify-content-end align-items-center" navbar>
							<NavItem>
								<NavLink tag={RRNavLink} onClick={hideMenu} to="/artifacts">
									Артефакты
								</NavLink>
							</NavItem>
						</Nav>
					</Collapse>
				</Container>
			</Navbar>
		</header>
    );
};

export default Header;