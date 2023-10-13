import { Button, Navbar } from "flowbite-react";
import {
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, Outlet } from "react-router-dom";

import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Layout: FunctionComponent = () => {
  const navbarRef = useRef<HTMLDivElement>(null);

  const [navbarHeight, setNavbarHeight] = useState<number>(0);

  useEffect(() => {
    if (navbarRef.current?.clientHeight) {
      setNavbarHeight(navbarRef.current.clientHeight);
    }
  }, []);

  const handleNavigateToContact = useCallback(() => {
    const contactEl = document.getElementById("contact");
    contactEl?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleNavigateToHome = useCallback(() => {
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  return (
    <Fragment>
      <div ref={navbarRef} className="shadow-md fixed top-0 inset-x-0 z-20">
        <Navbar rounded={true}>
          <Navbar.Brand as={Link} to="/" onClick={handleNavigateToHome}>
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white hidden lg:block">
              Pradipta Agus
            </span>
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white lg:hidden">
              Pradipta
            </span>
          </Navbar.Brand>
          <div className="flex md:order-2 gap-4">
            <Button as={Link} to="/#contact" onClick={handleNavigateToContact}>
              Let&apos;s work together
            </Button>
            <Navbar.Toggle />
          </div>
          <Navbar.Collapse>
            <Navbar.Link as={Link} to="/" onClick={handleNavigateToHome}>
              Home
            </Navbar.Link>
            <Navbar.Link
              as={Link}
              to="/#contact"
              onClick={handleNavigateToContact}
            >
              Contact
            </Navbar.Link>
          </Navbar.Collapse>
        </Navbar>
      </div>
      <div
        className="container mx-auto mb-10"
        style={{
          paddingTop: navbarHeight + 32,
        }}
      >
        <Outlet />
      </div>
      <footer className="container mx-auto">
        <div className="bg-gray-100 rounded-lg py-10 px-4 md:p-20" id="contact">
          <div className="text-lg lg:text-2xl font-bold mb-2">
            LET&apos;S WORK TOGETHER
          </div>
          <div className="flex md:justify-between flex-wrap gap-4">
            <a
              href="mailto:igedeaguspradipta@gmail.com"
              className="text-lg lg:text-2xl underline underline-offset-2 block w-full md:w-auto flex-1"
            >
              igedeaguspradipta@gmail.com
            </a>
            <div className="flex gap-4 w-full md:w-auto">
              <a href="mailto:igedeaguspradipta@gmail.com" className="block">
                <FontAwesomeIcon icon={faEnvelope} size="2x" />
              </a>
              <a
                href="https://www.linkedin.com/in/pradipta-agus-269370167/"
                target="_blank"
                className="block"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faLinkedin} size="2x" />
              </a>
            </div>
          </div>
        </div>
        <div className="text-sm py-4 text-center">
          Built with ❤️️ by Pradipta Agus
        </div>
      </footer>
    </Fragment>
  );
};

export default Layout;
