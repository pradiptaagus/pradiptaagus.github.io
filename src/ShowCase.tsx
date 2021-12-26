import { useEffect, useState } from "react";
import ShowCaseInterface from "./ShowCaseInterface";

type Props = {
    isShow: boolean;
    data?: ShowCaseInterface;
    handleClose: () => void;
};

const Modal = ({ isShow, data, handleClose }: Props) => {
    const [activeImage, setActiveImage] = useState<string>();

    useEffect(() => {
        if (data?.images.length) {
            setActiveImage(data.images[0]);
        }
    }, [data]);

    useEffect(() => {
        if (isShow) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isShow]);

    return (
        <div
            className={`${
                isShow ? "opacity-1 visible" : "opacity-0 invisible"
            } transition-all duration-200 ease-in-out`}
        >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-80 z-50 transition-all duration-200 ease-in-out overflow-y-auto">
                <div className="dark:bg-gray-900 w-full custom-container mx-auto rounded my-6">
                    <div className="text-2xl font-semibold py-4 px-6 border-b dark:border-gray-800 dark:text-gray-100">
                        Showcase
                    </div>
                    <div className="p-6 dark:text-gray-100">
                        <img
                            src={activeImage}
                            alt="Thumbnail"
                            className="max-h-96 w-auto mx-auto"
                        />

                        <div className="flex justify-start md:justify-center pt-4 overflow-x-auto">
                            {data?.images.map((item, index) => (
                                <img
                                    key={index}
                                    src={item}
                                    alt="Item"
                                    className={`h-16 w-auto cursor-pointer ${
                                        index < data.images.length - 1
                                            ? "pr-2"
                                            : "pr-0"
                                    }`}
                                    onClick={() => setActiveImage(item)}
                                />
                            ))}
                        </div>

                        <div className="text-2xl dark:text-gray-100 font-semibold pt-12 pb-6">
                            {data?.title}
                        </div>

                        <div className="text-lg text-gray-100">
                            {data?.desc}
                        </div>
                    </div>
                    <div className="py-4 px-6 border-t dark:border-gray-800">
                        <button
                            className="text-gray-100 rounded underline underline-offset-2"
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
