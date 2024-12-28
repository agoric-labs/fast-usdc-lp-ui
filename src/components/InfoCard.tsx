type Props = {
  label: string;
  data: string;
  footer: string;
};
const InfoCard = ({ label, data, footer }: Props) => {
  return (
    <div className="shadow rounded-lg bg-white p-7 pt-6 col-span-1">
      <div className="text-gray-500 text-lg font-medium">{label}</div>
      <div className="text-2xl font-bold mt-2 mb-1">{data}</div>
      <div className="text-gray-500 text-sm font-medium">{footer}</div>
    </div>
  );
};

export default InfoCard;
