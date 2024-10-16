import { Modal } from "../../GenericComponents"

const GoogleSignIn = ({isGoogleSigninRequired,closeGooglePopup, getGoogleData }) => {
    console.log("google sign in file")
    return  <Modal
    open={isGoogleSigninRequired}
    width="w-2/3"
    children={
      <div>
        <p className="text-lg font-semibold mb-3">
          Google Sign-in Required
        </p>
        <hr />
        <p className="text-sm my-4 pr-7 mb-4">
          Looks like you previously signed in via Google. You'll need to
          sign-in there to continue.
        </p>
        <div className="flex justify-end mt-10">
          <button
            className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-28 mr-5"
            onClick={getGoogleData}
          >
            Continue
          </button>
          <button
            className="cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-28"
            onClick={closeGooglePopup}
          >
            Cancel
          </button>
        </div>
      </div>
    }
  />
}

export default GoogleSignIn