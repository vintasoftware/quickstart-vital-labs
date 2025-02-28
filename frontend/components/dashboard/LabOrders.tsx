import { VStack, Heading, HStack, Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { OrderTestDialog } from "./OrderTestDialog";
import { Card } from "../Card";
import { LabTestTemplates } from "./LabTestTemplates";
import { LabTestOrdersTable } from "./LabTestOrdersTable";

const defaultTestsList = [
    {
        name: "Test 1",
        date: "2021-01-01",
        user: "John Doe",
        status: "Pending",
    },
    {
        name: "Test 2",
        date: "2021-01-02",
        user: "Jane Doe",
        status: "Completed",
    },
];

// Add sample template data
const defaultTemplatesList = [
    {
        id: 1,
        name: "Basic Health Panel",
        description: "Standard health checkup tests",
        tests: [
            { name: "Complete Blood Count", description: "Measures blood cells and components" },
            { name: "Lipid Panel", description: "Measures cholesterol and triglycerides" },
            { name: "Glucose Test", description: "Measures blood sugar levels" }
        ]
    },
    {
        id: 2,
        name: "Cardiac Panel",
        description: "Tests for heart health assessment",
        tests: [
            { name: "Troponin", description: "Detects heart damage" },
            { name: "CK-MB", description: "Enzyme released during heart attack" }
        ]
    }
];

// Define an interface for your test objects
interface LabTest {
  name: string;
  date: string;
  user: string;
  status: string;
}

export const LabOrders = () => {
  // Specify the type when initializing the state
  const [tests, setTests] = useState<LabTest[]>([]);

  useEffect(() => {
    setTests(defaultTestsList);
  }, []);
  
  return (
    <HStack width={"100%"} alignItems="stretch" height="100%">
        <VStack width="50%" height="100%">
            <Card>
                <Box height="100%">
                    <Heading>Lab Test Orders</Heading>
                    <Box><OrderTestDialog /></Box>
                    <LabTestOrdersTable tests={tests} />
                </Box>
            </Card>
        </VStack>
        <VStack width="50%" height="100%">
            <LabTestTemplates initialTemplates={defaultTemplatesList} />
        </VStack>
    </HStack>
  );
};
