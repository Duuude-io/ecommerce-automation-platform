import asyncio

from sms_service import send_sms_otp


async def run_test():
    result = await send_sms_otp("08051583807", "123456")
    print(result)

asyncio.run(run_test())
