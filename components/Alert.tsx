import React from "react";
import {
    ExclamationTriangleIcon,
    XCircleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
} from "@heroicons/react/20/solid";

interface AlertProps {
    type?: "default" | "warning" | "error" | "success";
    title: string;
    desc: string;
}

const alertStyles = {
    default: {
        bg: "bg-blue-50",
        iconColor: "text-blue-400",
        titleColor: "text-blue-800",
        descColor: "text-blue-700",
        Icon: InformationCircleIcon,
    },
    warning: {
        bg: "bg-yellow-50",
        iconColor: "text-yellow-400",
        titleColor: "text-yellow-800",
        descColor: "text-yellow-700",
        Icon: ExclamationTriangleIcon,
    },
    error: {
        bg: "bg-red-50",
        iconColor: "text-red-400",
        titleColor: "text-red-800",
        descColor: "text-red-700",
        Icon: XCircleIcon,
    },
    success: {
        bg: "bg-green-50",
        iconColor: "text-green-400",
        titleColor: "text-green-800",
        descColor: "text-green-700",
        Icon: CheckCircleIcon,
    },
};

const Alert: React.FC<AlertProps> = ({ type = "default", title, desc }) => {
    const { bg, iconColor, titleColor, descColor, Icon } = alertStyles[type];

    return (
        <div className={`rounded-md p-4 ${bg}`}>
            <div className="flex">
                <div className="shrink-0">
                    <Icon aria-hidden="true" className={`size-5 ${iconColor}`} />
                </div>
                <div className="ml-3">
                    <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>
                    <div className={`mt-2 text-sm ${descColor}`}>
                        <p>{desc}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alert;
