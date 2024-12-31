"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from 'axios';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

// Define types for form data
interface FormData {
    id_box: string;
}

// Define types for API response
interface BoxDetail {
    created_at: string;
    id_box: string;
    no_wo: string;
    status_matching: string;
    updated_at: string;
    pn: string;
    pn_sequence: number;
}

interface ApiResponse {
    box_details: BoxDetail[];
}

interface CheckoutResponse {
    success: boolean;
    message: string;
}

const formSchema = z.object({
    id_box: z.string().min(1, { message: "ID Box is required" }),
});

export function TransactionScan({ station }: { station: string }) {
    console.log("Station:", station);
    const { register, handleSubmit } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });
    const [boxDetails, setBoxDetails] = useState<BoxDetail[]>([]);
    const { toast } = useToast();

    const onSubmit = async (data: FormData) => {
        try {
            const response = await axios.get<ApiResponse>(`https://portal4.incoe.astra.co.id:4434/api/get_data_box_detail?id_box=${data.id_box}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            });
            setBoxDetails(response.data.box_details);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch box details. Please try again.",
            });
        }
    };

    const handleCheckout = async () => {
        const userDataString = localStorage.getItem('user');
        let userData = null;

        if (userDataString) {
            userData = JSON.parse(userDataString);
        }

        if (boxDetails.length === 0) {
            console.error("No box details available for checkout.");
            toast({
                variant: "destructive",
                title: "Error",
                description: "No box details available for checkout.",
            });
            return;
        }

        const checkoutData = {
            boxes: boxDetails.map(box => ({
                user_id: userData?.id_user || "",
                id_box: box.id_box,
                no_wo: box.no_wo,
                pn: box.pn,
                status_matching: box.status_matching,
                station: station
            }))
        };

        try {
            const response = await axios.post<CheckoutResponse>(
                'https://portal4.incoe.astra.co.id:4434/api/checkout_box', 
                checkoutData, 
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.data.success) {
                toast({
                    title: "Success",
                    description: response.data.message,
                    className: "bg-green-500 text-white",
                });
                setBoxDetails([]);
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to process checkout. Please try again.",
            });
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-100 rounded-lg shadow-md">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
                <Label htmlFor="id_box" className="font-semibold">Scan QR</Label>
                <Input
                    id="id_box"
                    {...register("id_box")}
                    placeholder="Enter ID Box"
                    className="p-2 border rounded-md"
                />
                <Button type="submit" className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Check</Button>
            </form>

            <div>
                <h3 className="text-lg font-bold">List Data</h3>
                {boxDetails.length > 0 ? (
                    <div className="space-y-4">
                        {boxDetails.map((item, index) => (
                            <div key={index} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
                                <div className="font-semibold">ID Box: <span className="font-normal">{item.id_box}</span></div>
                                <div>PN: <span className="font-normal">{item.pn}</span></div>
                                <div>WO No: <span className="font-normal">{item.no_wo}</span></div>
                                <div>Status: <span className="font-normal">{item.status_matching}</span></div>
                                <div>Created At: <span className="font-normal">{new Date(item.created_at).toLocaleString()}</span></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No data available</p>
                )}
            </div>

            {boxDetails.length > 0 && (
                <Button onClick={handleCheckout} className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600">
                    Checkout
                </Button>
            )}
        </div>
    );
}

export default TransactionScan;