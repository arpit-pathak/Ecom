import { useMediaQuery } from "@mui/material";
import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import Preview from "../components/productDetailsComponents/Preview";
export default function PreviewProduct() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <Preview></Preview>
      <Links></Links>
    </div>
  );
}
