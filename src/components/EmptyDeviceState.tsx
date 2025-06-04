
interface EmptyDeviceStateProps {
  // This component doesn't need any props since it's purely informational
}

export const EmptyDeviceState = ({}: EmptyDeviceStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <h2 className="text-2xl font-bold text-white mb-4">No Devices Added</h2>
      <p className="text-slate-400 mb-6">
        Start by adding your Raspberry Pi devices using the "Add Device" button above.
      </p>
    </div>
  );
};
