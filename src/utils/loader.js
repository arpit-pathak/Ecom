
import CircularProgress from '@mui/material/CircularProgress';


export default function Loader({ height, width, color }) {
    return <CircularProgress style={{ "color": color ?? "white", "width": width ?? "25px", "height": height ?? "25px" }} />;
}

export function PageLoader({ height, width, color }) {
    return  <div className="fixed inset-0 flex items-center justify-center z-40 bg-slate-500 bg-opacity-25">
        <Loader color={color ?? "#f5ab35"} width={width} height={height} />
    </div>;
}