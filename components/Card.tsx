import { FC } from "react";

interface CardProps {
    title?: string;
    children: React.ReactNode;
}

const Card: FC<CardProps> = ({ title, children }) => {
    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
                <div className={`${title ? "mt-2" : ""} text-sm text-gray-500`}>{children}</div>
            </div>
        </div>
    );
};

export default Card;
