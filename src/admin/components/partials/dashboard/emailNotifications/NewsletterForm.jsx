export const NewsletterSearchForm = ({
  onConfirm,
  onReset,
  sendToChoices,
  statusList,
}) => {

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    onConfirm(formData);
  };

  const handleReset = () => {
    const emptyFormData = new FormData();
    document.getElementById("searchForm").reset();
    onConfirm(emptyFormData);
    onReset(true);
  };

  return (
    <form id="searchForm" onSubmit={handleSubmit}>
      <h1 className="text-base font-semibold mb-2">Filters: </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <select
          name="status"
          id="status"
          className="mt-1 block w-full py-2 my-4 px-3 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-300 capitalize"
        >
          <option value="">Status</option>
          {statusList.map((option, i) => (
            <option key={i} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="send_to"
          id="send_to"
          className="mt-1 block w-full py-2 my-4 px-3 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-300 capitalize"
        >
          <option value="">Sent To</option>
          {sendToChoices.map((option, i) => (
            <option key={i} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
      >
        Search
      </button>
      <button
        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        onClick={handleReset}
      >
        Reset
      </button>
    </form>
  );
};
