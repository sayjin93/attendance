const Skeleton = ({ times = 1, rootCls = "", innerCls = "", ...props }) => {
    const boxes = Array(times)
        .fill(0)
        .map((_, i) => {
            return (
                <div key={i} className={`skeleton ${rootCls}`} {...props}>
                    <div className={`skeleton-inner ${innerCls}`} />
                </div>
            );
        });

    return <>{boxes}</>;
};

export default Skeleton;
