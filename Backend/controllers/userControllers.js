import TryCatch from "../utlis/Trycatch.js";
import {User} from "../models/userModel.js";
import getDataUrl from "../utlis/urlGenerator.js";
import cloudinary from  "cloudinary";
import bcrypt from 'bcrypt';

export const myProfile = TryCatch(async (req,res) => {
    const user = await User.findById(req.user._id).select("-password");

    res.json(user);
});

export const userProfile = TryCatch(async(req,res)=>{
    const user = await User.findById(req.params.id).select("-passowrd");

    if(!user) return res.status(404).json({
        message: "No user with is id",
    });

    res.json(user);
});

export const followandUnfollowUser = TryCatch(async(req,res)=>{
    const user = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if(!user)
        return res.status(404).json({
    message: "NO User with is id",
    });

    if(user._id.toString() === loggedInUser._id.toString())
         return res.status(400).json({
        message: "You can not follow yourself",      
    });

    if(user.followers.includes(loggedInUser._id)){
        const indexFollowing = loggedInUser.followings.indexOf(user._id);
        const indexFollower = user.followers.indexOf(loggedInUser._id);


        loggedInUser.followings.splice(indexFollowing,1);
        user.followers.splice(indexFollower,1);

        await loggedInUser.save();
        await user.save();

        res.json({
            message: "user Unfollowed",
        });
    }else{
        loggedInUser.followings.push(user._id);
        user.followers.push(loggedInUser._id);

        await loggedInUser.save();
        await user.save();

        res.json({
            message: "user Followed",
        });
    }
});
export const userFollowerandFollowingData = TryCatch(async(req,res)=>{
    const user = await User.findById(req.params.id).select("-password")
    .populate("followers followings");
    res.json({
        user,
    });
});

export const updateProfile = TryCatch(async(req,res)=>{
    const user = await User.findById(req.user._id)


    const {name} = req.body;

    if(name){
        user.name = name;
    }
    const file= req.file;
    if(file){
        const fileUrl = getDataUrl(file);

        await cloudinary. v2.uploader.destroy(user.profilePic.id);

        const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content);

        user.profilePic.id = myCloud.public_id;
        user.profilePic.url= myCloud.secure_url;
    }

    await user.save()

    res.json({
        message: "profile updated",
    });
});

export const updatePassword = TryCatch(async(req,res)=>{
    const user = await User.findById(req.user._id);

    const {oldPassword, newPassword} = req.body;

    const comparePassword = await bcrypt.compare(oldPassword, user.password);

    if(!comparePassword) 
        return res.status(400).json({
        message: "Wrong Old Password",
    });

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({
        message: "Password Updated",
    });
});

