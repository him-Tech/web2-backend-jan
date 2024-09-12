import { mockRequest, mockResponse } from "../__mocks__";
import { UserController } from "../../controllers/user.controllers";

describe("getUsers", () => {
  it("should return an array of users", () => {
    UserController.getUsers(mockRequest, mockResponse);
    expect(mockResponse.send).toHaveBeenCalledWith([]);
  });
});
