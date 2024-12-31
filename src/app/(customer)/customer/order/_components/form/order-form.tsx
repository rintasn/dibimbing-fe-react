"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSWR from 'swr';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for the API response
interface ApiResponse {
  orders: Array<{
    increment_id: string; // Change to string to match the API response
  }>;
}

type UnitType = 'Battery' | 'Charger' | 'BatteryCharger';

// Create a fetcher function using Axios
const fetcher = (url: string) => axios.get<ApiResponse>(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  },
}).then(res => res.data);

function OrderForm() {
  const [selectedUnit, setSelectedUnit] = useState<UnitType | ''>("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedAH, setSelectedAH] = useState("");
  const [orderID, setOrderID] = useState("");
  const [quantity, setQuantity] = useState(1); // State for quantity
  const [notes, setNotes] = useState(""); // State for notes
  const [reqDeliv, setReqDeliv] = useState(""); // State for notes

  const { data, error } = useSWR<ApiResponse>('https://portal4.incoe.astra.co.id:4434/api/get_last_id_increment', fetcher);

  // Define the unit images with explicit typing
  const unitImages: Record<UnitType | 'default', string> = {
    Battery: "https://cbi-astra.com/wp-content/uploads/2024/09/Lithium-Battery-Incoe-Traction-Lithium-Battery-4-242x300.jpg",
    Charger: "https://cbi-astra.com/wp-content/uploads/2024/09/Lithium-Battery-Incoe-Traction-Lithium-Battery-3-242x300.jpg",
    BatteryCharger: "https://cbi-astra.com/wp-content/uploads/2024/09/Lithium-Battery-Incoe-Traction-Lithium-Battery-242x300.jpg",
    default: "https://cbi-astra.com/wp-content/uploads/2024/09/Lithium-Battery-Incoe-Traction-Lithium-Battery-4-242x300.jpg",
  };

  // Function to handle unit selection
  const handleUnitChange = (value: UnitType) => {
    setSelectedUnit(value);
  };

  // Function to handle type selection
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  // Function to handle AH selection
  const handleAHChange = (value: string) => {
    setSelectedAH(value);
  };

  // Generate order ID based on selections
  useEffect(() => {
    const unitCode = selectedUnit 
      ? {
          Battery: "A",
          Charger: "B",
          BatteryCharger: "C",
        }[selectedUnit] 
      : "";

    const typeCode = {
      "8FBN25": "A1",
      FB25: "A2",
      FB30: "A3",
      "FB15-12": "A4",
      "FB15-13": "A5",
      "FB15-14": "A6",
      "FB15-15": "A7",
      "8FBMT50": "A8",
    }[selectedType] || "A9";

    const ahCode = {
      "210": "AM1",
      "400": "AM2",
      "605": "AM3",
      "800": "AM4",
    }[selectedAH] || "";

    // Generate order number based on increment_id
    const incrementId = parseInt(data?.orders[0]?.increment_id ?? "0", 10); // Use "0" as a fallback if increment_id is undefined
    let incrementIdInt = incrementId + 1; // Increment the ID by 1
    const formattedIncrementId = `A${String(incrementIdInt).padStart(4, '0')}`; // Format increment_id

    // Set the order ID
    setOrderID(`${unitCode}-${typeCode}-${ahCode}-${formattedIncrementId}`);
  }, [selectedUnit, selectedType, selectedAH, data]);

  // Retrieve user data from sessionStorage
  const userDataString = localStorage.getItem('user');
  let userData = null;

  if (userDataString) {
    userData = JSON.parse(userDataString);
  }

  let id_user = null;
  let bpid = null;

  if (userData) {
    id_user = userData.id_user;
    bpid = userData.bpid;
  }

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    // Prepare the data to be sent
    const orderData = {
      id_user,
      bpid,
      orderID,
      selectedUnit,
      selectedType,
      selectedAH,
      quantity,
      notes,
      reqDeliv,
      increment_id,
    };

    console.log(orderData);

    try {
      // Make a POST request to insert data
      const response = await axios.post('https://portal4.incoe.astra.co.id:4434/api/insert_data_order', orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle successful response
      console.log('Order submitted successfully:', response.data);
      // Optionally reset the form or show a success message
    } catch (error) {
      console.error('Error submitting order:', error);
      // Handle error (e.g., show an error message)
    }
  };

  const increment_id = parseInt(data?.orders[0]?.increment_id ?? "0", 10)+1;
  
  // Handle loading and error states
  if (!data && !error) return <div>Loading...</div>; // Show loading state
  if (error) return <div>Error: {error.message}</div>; // Show error state

  return (
    <div className="container p-6 mx-auto">
      <form className="grid grid-cols-2 gap-8 p-8 bg-white rounded-lg shadow-lg" onSubmit={handleSubmit}>
        <input type="hidden" name="id_user" value={id_user || ''} />
        <input type="hidden" name="bpid" value={bpid || ''} />
        <input type="hidden" name="increment_id" value={increment_id || ''} />

        <div className="space-y-6">
          <h2 className="mb-6 text-2xl font-bold text-center text-orange-600">
            Battery Order Form
          </h2>

          <div className="grid items-center grid-cols-2 gap-4">
            <Label htmlFor="brand" className="text-right">
              Brand:
            </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Brands</SelectLabel>
                  <SelectItem value="brand1">Brand A</SelectItem>
                  <SelectItem value="brand2">Brand B</SelectItem>
                  <SelectItem value="brand3">Brand C</SelectItem>
                  <SelectItem value="brand4">Brand D</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid items-center grid-cols-2 gap-4">
            <Label htmlFor="type" className="text-right">
              Type:
            </Label>
            <Select onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Types</SelectLabel>
                  <SelectItem value="8FBN25">8FBN25</SelectItem>
                  <SelectItem value="FB25">FB25</SelectItem>
                  <SelectItem value="FB30">FB30</SelectItem>
                  <SelectItem value="FB15-12">FB15-12</SelectItem>
                  <SelectItem value="FB15-13">FB15-13</SelectItem>
                  <SelectItem value="FB15-14">FB15-14</SelectItem>
                  <SelectItem value="FB15-15">FB15-15</SelectItem>
                  <SelectItem value="8FBMT50">8FBMT50</SelectItem>
                  <SelectItem value="8FBN26">8FBN26</SelectItem>
                  <SelectItem value="8FBN27">8FBN27</SelectItem>
                  <SelectItem value="8FBN28">8FBN28</SelectItem>
                  <SelectItem value="8FBN15">8FBN15</SelectItem>
                  <SelectItem value="4CBTY2">4CBTY2</SelectItem>
                  <SelectItem value="8FBN-25">8FBN-25</SelectItem>
                  <SelectItem value="BFBN15">BFBN15</SelectItem>
                  <SelectItem value="8FBR25">8FBR25</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid items-center grid-cols-2 gap-4">
            <Label htmlFor="voltage" className="text-right">
              Voltage:
            </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select voltage" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Voltages</SelectLabel>
                  <SelectItem value="51.2">51.2V</SelectItem>
                  <SelectItem value="76">76V</SelectItem>
                  <SelectItem value="80">80V</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid items-center grid-cols-2 gap-4">
            <Label htmlFor="ah" className="text-right">
              AH:
            </Label>
            <Select onValueChange={handleAHChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select AH" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>AH Ratings</SelectLabel>
                  <SelectItem value="210">210 AH</SelectItem>
                  <SelectItem value="400">400 AH</SelectItem>
                  <SelectItem value="605">605 AH</SelectItem>
                  <SelectItem value="800">800 AH</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid items-center grid-cols-2 gap-4">
            <Label htmlFor="qty" className="text-right">
              Quantity:
            </Label>
            <Input
              id="qty"
              type="number"
              placeholder="Enter quantity"
              className="w-full"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="grid items-center grid-cols-2 gap-4">
            <Label htmlFor="reqDeliv" className="text-right">
              Required Delivery:
            </Label>
            <Input id="reqDeliv" type="date" placeholder="Select date"  onChange={(e) => setReqDeliv(e.target.value)} className="w-full" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid items-center grid-cols-2 gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit:
            </Label>
            <Select onValueChange={handleUnitChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Units</SelectLabel>
                  <SelectItem value="Battery">Battery</SelectItem>
                  <SelectItem value="Charger">Charger</SelectItem>
                  <SelectItem value="BatteryCharger">Battery & Charger</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <img
              src={unitImages[selectedUnit || 'default']}
              alt="Selected Unit"
              className="w-[200px] h-auto rounded-lg shadow-md"
            />
          </div>

          <Input
            id="orderID"
            type="text"
            value={orderID}
            placeholder="ID Order"
            className="w-full"
            readOnly
          />
          <Input
            id="notes"
            type="text"
            placeholder="Notes"
            className="w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex justify-center col-span-2 mt-6 space-x-4">
          <Button
            type="submit"
            className="text-white bg-orange-500 hover:bg-orange-600"
          >
            Submit Order
          </Button>
          <Button
            variant="outline"
            className="text-orange-500 hover:bg-orange-50"
          >
            Generate ID Order & Seri
          </Button>
        </div>
      </form>
    </div>
  );
}

export default OrderForm;
