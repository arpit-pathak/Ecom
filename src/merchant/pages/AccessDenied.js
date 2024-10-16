const AccessDenied = () => {
  return (
    <div className="bg-white w-full h-[500px] overflow-hidden flex flex-col items-center justify-center">
      <p className="font-bold text-lg text-orangeButton">ACCESS DENIED!</p>
      <p>
        You don't have permission to view this page. Please contact your
        administrator!
      </p>
    </div>
  );
};

export default AccessDenied;
