import { useState, useEffect } from "react";
import { Modal, Box, Button, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const OTPVerifyWindow = ({ open, onClose, type, value, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      sendOtp();
    }
     // eslint-disable-next-line
  }, [open]);

  const sendOtp = async () => {
    if (!value) return toast.error(`Missing ${type} value`);

    setSending(true);
    try {
      const res = await axios.post("http://localhost:4000/otp/send-otp", {
        type,
        value,
      });

      if (res.data.success) {
        toast.success(`${type === "phone" ? "Phone" : "Email"} OTP sent`);

      } else {
        throw new Error(res.data.message || "OTP send failed");
      }
    } catch (err) {
      console.error(err);
      onClose()
      toast.error(`Failed to send OTP for ${type}`);
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) return toast.error("Please enter the OTP");

    setVerifying(true);
    try {
      const res = await axios.post("http://localhost:4000/otp/verify-otp", {
        type,
        value,
        otp,
      });

      if (res.data.success) {
        toast.success(`${type} verified!`);
        onVerified();
        onClose();
      } else {
        toast.error("Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("OTP verification failed");
    } finally {
      setVerifying(false);
    }

    setOtp("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          maxWidth: 400,
          mx: "auto",
          mt: "20vh",
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" mb={2}>
          Verify your {type}
        </Typography>

        <Typography variant="body2" mb={1}>
          OTP will be sent to:{" "}
          <strong>{type === "phone" ? `Whattsapp no. +91 ${value}` : value}</strong>
        </Typography>

        <TextField
          fullWidth
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box display="flex" justifyContent="space-between">
          <Button onClick={sendOtp} disabled={sending}>
            {sending ? "Sending..." : "Resend OTP"}
          </Button>
          <Button
            variant="contained"
            onClick={verifyOtp}
            disabled={verifying || !otp}
          >
            {verifying ? "Verifying..." : "Verify"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default OTPVerifyWindow;
