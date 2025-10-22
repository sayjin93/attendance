import { FC } from "react";

interface CardProps {
    title?: string;
    children: React.ReactNode;
}

const Card: FC<CardProps> = ({ title, children }) => {
    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
            <div className="px-6 py-6">
                {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
                <div className={`${title ? "" : ""} text-sm text-gray-700`}>{children}</div>
            </div>
        </div>
    );
};

export default Card;
