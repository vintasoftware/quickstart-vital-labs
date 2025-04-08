import { HStack } from "@chakra-ui/react";
import { LabTestTemplates } from "./LabTestTemplates";
import { LabTestOrdersTable } from "./LabTestOrdersTable";


const style = {
  display: "flex",
  gap: "20px",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  width: "100%",
  padding: 0,
  margin: 0,
};

export const LabOrders = () => {
  return (
    <HStack width={"100%"} style={style}>
        <LabTestOrdersTable />
        <LabTestTemplates />
    </HStack>
  );
};
