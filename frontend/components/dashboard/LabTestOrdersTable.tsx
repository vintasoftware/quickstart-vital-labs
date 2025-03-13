import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";

// Define the test type
interface LabTest {
  name: string;
  date: string;
  user: string;
  status: string;
}

interface LabTestOrdersTableProps {
  orders: LabOrder[];
}

export const LabTestOrdersTable = ({ orders }: LabTestOrdersTableProps) => {
  return (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>Lab Tests Orders</TableCaption>
        <Thead>
          <Tr>
            <Th>Test Name</Th>
            <Th>Date</Th>
            <Th>User</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.length > 0 ? (
            orders.map((order: any, index: any) => (
              <Tr key={index}>
                <Td>{order.lab_test.name}</Td>
                <Td>{order.created_at}</Td>
                <Td>{order.patient_details.first_name} {order.patient_details.last_name}</Td>
                <Td>{order.status}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={4} textAlign="center">No lab orders available</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}; 