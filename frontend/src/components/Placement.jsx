import { Link } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import PlacementOne from "./PlacementOne";
import PlacementTwo from "./PlacementTwo";
import PlacementThree from "./PlacementThree";

const Placement = () => {
  return (
    <div>
      <h1 className="mx-auto text-center text-3xl sm:text-5xl underline underline-offset-4">
        PLACEMENT RECORDS
      </h1>
      <nav className="flex flex-col sm:flex-row justify-center gap-5 my-10">
        <Link
          className="border-black font-bold text-center border py-3 px-5 rounded-lg bg-slate-300 hover:bg-slate-400 w-full sm:w-auto"
          to="/db/placement/placement-one"
        >
          Placement One
        </Link>
        <Link
          className="border-black font-bold text-center border py-3 px-5 rounded-lg bg-slate-300 hover:bg-slate-400 w-full sm:w-auto"
          to="/db/placement/placement-two"
        >
          Placement Two
        </Link>
        <Link
          className="border-black font-bold text-center border py-3 px-5 rounded-lg bg-slate-300 hover:bg-slate-400 w-full sm:w-auto"
          to="/db/placement/placement-three"
        >
          Placement Three
        </Link>
      </nav>
      <Routes>
        <Route path="placement-one" element={<PlacementOne />} />
        <Route path="placement-two" element={<PlacementTwo />} />
        <Route path="placement-three" element={<PlacementThree />} />
      </Routes>
    </div>
  );
};

export default Placement;