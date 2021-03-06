import routes from "../routes";
import logo from "../assets/img/icons/logo.png";
import { Link, useLocation } from "react-router-dom";
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Logo = () => {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const location = useLocation();

  return (
    <div className="logo d-flex align-items-center">
      <img src={logo} height={48} className="me-2" />

      {location.pathname == routes.home ? (
        <div
          className="text-white text-decoration-none fs-3 fw-bold"
          onClick={handleClick}
        >
          RankRise
        </div>
      ) : (
        <Link
          to={routes.home}
          className="text-white text-decoration-none fs-3 fw-bold"
        >
          RankRise
        </Link>
      )}
    </div>
  );
};

const Header = () => {
  return (
    <div className="mt-auto">
      <footer>
        <Logo />
        <div className="right-side">
          <div className="copyright">
            Copyright &copy; 2022 by{" "}
            <a href="https://egorindev.com" target="_blank" rel="noreferrer">
              Egor Zorin
            </a>
          </div>
          <div className="social-media">
            <a
              href="https://github.com/Egor4ik325"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
            <a
              href="https://linkedin.com/in/nezort11"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a
              href="https://twitter.com/nezort11"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Header;
