import { ImCross } from "react-icons/im";
export default function PriceBreakDown({ close, orderDetails }) {
  const titleCss = "border-y priceKey";
  const valueCss = "border-y border-l priceValue";
  return (
    <div className="flex flex-col gap-4 w-[500px]">
      <table className="text-end">
        <tr>
          <td className={titleCss}>Product Cost</td>
          <td className={valueCss}>$ {orderDetails.formatted_order_total}</td>
        </tr>
        <tr>
          <td className={titleCss}>Shipping Fee</td>
          <td className={valueCss}>
            $ {orderDetails.formatted_total_shipping}
          </td>
        </tr>
        <tr>
          <td className={titleCss}>Voucher Discount</td>
          <td className={`${valueCss} `}>
            - $ {orderDetails.formatted_total_discount}
          </td>
        </tr>
        <tr>
          <td className={titleCss}>Order Total</td>
          <td className="border-y border-l text-red-500 text-[20px] pr-2">
            $ {orderDetails.formatted_total_paid}
          </td>
        </tr>
      </table>
    </div>
  );
}
