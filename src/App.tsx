import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import images from "./images";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import ShowCase from "./ShowCase";
import ShowCaseInterface from "./ShowCaseInterface";
import ProjectInterface from "./ProjectInterface";

const projects: ProjectInterface[] = [
    {
        title: "Bali Bean Spice Website",
        thumbnail: images.bbs1,
        position: "Fullstack",
        desc: "The company profile of Bali Bean Spice that provide latest information about it and order media.",
        images: [images.bbs1, images.bbs2, images.bbs3, images.bbs4],
        url: "https://www.balibeanspice.com/",
    },
    {
        title: "UMi Corner",
        thumbnail: images.umi0,
        position: "Front-end",
        desc: "An web application that integrate multiple bank products such BRI, Pegadaian, & Mekaar for easiest customer to reach.",
        images: [images.umi1, images.umi2, images.umi3, images.umi4],
    },
];

const App = () => {
    const headerRef = useRef<HTMLDivElement>(null);

    const footerRef = useRef<HTMLDivElement>(null);

    const [activeDate, setActiveData] = useState<ShowCaseInterface>();

    function goToTop() {
        if (headerRef.current) {
            window.scroll({
                top: headerRef.current.offsetTop,
                behavior: "smooth",
            });
        }
    }

    function goToContact() {
        if (footerRef.current) {
            window.scroll({
                top: footerRef.current.offsetTop,
                behavior: "smooth",
            });
        }
    }

    return (
        <div className="dark:bg-gray-900 min-h-screen">
            <nav className="w-full py-5 px-4 md:px-0">
                <div className="custom-container mx-auto flex justify-between items-center">
                    <div
                        className="text-2xl md:text-3xl font-bold dark:text-gray-100 cursor-pointer"
                        onClick={goToTop}
                    >
                        Pradipta Agus
                    </div>
                    <div
                        className="text-base mdtext-lg dark:text-gray-500 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer"
                        onClick={goToContact}
                    >
                        Contact
                    </div>
                </div>
            </nav>
            <section className="flex items-center pt-40 md:pt-60">
                <div className="custom-container mx-auto">
                    <div
                        className="text-xl md:text-2xl dark:text-gray-100 font-medium px-4 md:pr-24 md:pl-0"
                        style={{ lineHeight: "2.5rem" }}
                    >
                        Hello, I am Pradipta Agus, a fullstack developer. I am
                        passionate about programming and very interested in and
                        keep learning new technologies. ❤️ beautiful code.
                    </div>
                </div>
            </section>

            <section className="custom-container mx-auto pt-44 md:pt-56">
                <div className="text-xl dark:text-gray-400 font-bold mb-6 px-4 md:px-0">
                    PROJECTS
                </div>

                {projects.map((item, index) => (
                    <div
                        key={index}
                        className={`border border-gray-700 rounded-md mx-4 md:mx-0 ${
                            index < projects.length - 1 ? "mb-6" : "mb-0"
                        }`}
                    >
                        <img
                            src={item.thumbnail}
                            alt="Thumbnail"
                            className="rounded-t"
                        />
                        <div className="p-6 relative">
                            <div className="text-lg dark:text-gray-400 font-semibold">
                                {item.position}
                            </div>
                            <div className="text-2xl dark:text-gray-100 font-semibold pt-4 pb-6">
                                {item.title}
                            </div>
                            <div className="text-lg dark:text-gray-100 pb-12">
                                {item.desc}
                            </div>
                            <div className="flex absolute left-6 bottom-6">
                                <button
                                    className="dark:text-gray-400 dark:hover:text-gray-100 underline underline-offset-2 inline-block mr-6"
                                    onClick={() => {
                                        setActiveData({
                                            title: item.title,
                                            desc: item.desc,
                                            images: item.images,
                                        });
                                    }}
                                >
                                    Showcase
                                </button>
                                {item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        className="dark:text-gray-400 dark:hover:text-gray-100 underline underline-offset-2 inline-block"
                                    >
                                        Live Visit
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <footer className="custom-container mx-auto pt-36" ref={footerRef}>
                <div className="pb-24 px-4 md:px-0">
                    <div className="text-md text-gray-400 font-semibold mb-2">
                        LET'S WORK TOGETHER
                    </div>
                    <div className="flex md:justify-between flex-wrap">
                        <a
                            href="mailto:igedeaguspradipta@gmail.com"
                            className="text-lg md:text-2xl text-gray-100 font-semibold underline underline-offset-2 inline-block flex-1 pb-2 md:pb-0"
                        >
                            igedeaguspradipta@gmail.com
                        </a>
                        <a
                            href="mailto:igedeaguspradipta@gmail.com"
                            className="inline-block mr-6"
                        >
                            <FontAwesomeIcon
                                icon={faEnvelope}
                                size="2x"
                                className="text-gray-100"
                            />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/pradipta-agus-269370167/"
                            target="_blank"
                            className="inline-block"
                        >
                            <FontAwesomeIcon
                                icon={faLinkedin}
                                size="2x"
                                className="text-gray-100"
                            />
                        </a>
                    </div>
                </div>
                <div className="text-gray-400 text-sm py-4 text-center">
                    &copy; created with ❤️️ by Pradipta Agus
                </div>
            </footer>
            <ShowCase
                isShow={!!activeDate}
                data={activeDate}
                handleClose={() => setActiveData(undefined)}
            />
        </div>
    );
};

export default App;
