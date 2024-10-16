import homeBanner from "../../../assets/buyer/banner-home-page.svg"

const CustomerHomeBanner = () => {
  return (
    <div className="max-h-[310px]">
      <img src={homeBanner} alt="banner-home" className="w-full" />
    </div>
  )
}

export default CustomerHomeBanner
